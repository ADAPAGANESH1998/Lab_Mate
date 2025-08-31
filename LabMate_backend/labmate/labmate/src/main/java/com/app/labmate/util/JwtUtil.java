package com.app.labmate.util;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "ThisIsA256BitSecretKeyForHMACSHA256Alg12345"; // 256-bit key
    private static final long EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

    // Generate JWT Token using Nimbus
    public String generateToken(String email) {
        try {
            // Create the JWT claims
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(email)
                    .issueTime(new Date())
                    .expirationTime(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                    .build();

            // Create the Signed JWT
            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet
            );

            // Sign the JWT with the secret key using MACSigner
            JWSSigner signer = new MACSigner(SECRET_KEY);
            signedJWT.sign(signer);

            // Return the serialized JWT token
            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    // Extract the username (email) from the JWT token
    public String extractUsername(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);  // Parse the token

            // Verify the token and get the claims
            MACVerifier verifier = new MACVerifier(SECRET_KEY);
            if (signedJWT.verify(verifier)) {
                return signedJWT.getJWTClaimsSet().getSubject();  // Extract the email (subject)
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid token", e);
        }
        return null;
    }

    // Validate the JWT Token
    public boolean validateToken(String token, String username) {
        return username.equals(extractUsername(token)) && !isTokenExpired(token);
    }

    // Check if the token has expired
    private boolean isTokenExpired(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);  // Parse the token
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expirationTime != null && expirationTime.before(new Date());  // Check expiration
        } catch (Exception e) {
            throw new RuntimeException("Error checking token expiration", e);
        }
    }

    // Extract the JWT token from the Authorization header
    public String extractToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7); // Remove "Bearer " prefix
        }
        return null;
    }
}
