package com.app.labmate.controller;

import com.app.labmate.model.LoginRequest;
import com.app.labmate.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.app.labmate.service.UserService;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthenticationController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;


}
