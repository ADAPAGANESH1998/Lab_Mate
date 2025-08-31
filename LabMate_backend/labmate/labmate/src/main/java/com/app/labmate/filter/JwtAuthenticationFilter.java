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

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Extract JWT from Authorization header
        String token = jwtUtil.extractToken(request.getHeader("Authorization"));

        if (token != null) {
            try {
                // Extract username (email) from the token
                String username = jwtUtil.extractUsername(token);

                // Validate the token
                if (username != null && jwtUtil.validateToken(token, username)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(username, null, null);
                    SecurityContextHolder.getContext().setAuthentication(authentication); // Set authentication
                }
            } catch (Exception e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
                return; // Don't proceed if the token is invalid
            }
        }

        filterChain.doFilter(request, response); // Continue with the filter chain
    }
}
