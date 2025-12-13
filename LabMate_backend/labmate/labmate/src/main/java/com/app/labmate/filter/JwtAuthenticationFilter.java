package com.app.labmate.filter;

import com.app.labmate.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Extract JWT from Authorization header
        String rawAuth = request.getHeader("Authorization");
        String token = jwtUtil.extractToken(rawAuth);
        logger.debug("JwtAuthenticationFilter: incoming request {} {}, remoteAddr={}, AuthorizationHeaderPresent={}", request.getMethod(), request.getRequestURI(), request.getRemoteAddr(), rawAuth != null);
        if (rawAuth != null) logger.debug("Authorization header (first 200 chars): {}", rawAuth.length() > 200 ? rawAuth.substring(0,200) + "..." : rawAuth);

        if (token != null) {
            try {
                // Extract username (email) from the token
                String username = jwtUtil.extractUsername(token);
                logger.debug("JwtAuthenticationFilter: extracted username from token={}", username);

                // Validate the token
                if (username != null && jwtUtil.validateToken(token, username)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, null);
                    SecurityContextHolder.getContext().setAuthentication(authentication); // Set authentication
                    logger.debug("JwtAuthenticationFilter: token valid, authentication set for {}", username);
                }
            } catch (Exception e) {
                logger.warn("JwtAuthenticationFilter: token validation failed: {}", e.getMessage());
                // Do not short-circuit the request here; allow downstream security rules to handle authorization.
                // Returning immediately can cause 401/403 responses before controllers are reached and makes debugging harder.
                // Continue the filter chain without setting authentication.
            }
        }

        filterChain.doFilter(request, response); // Continue with the filter chain
    }
}
