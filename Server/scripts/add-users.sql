-- Insert users with bcrypt hashed passwords
INSERT INTO users (email, password) VALUES
('biblioteca9101@sena.edu.co', '$2a$10$8KzaNdKIx.fpfZ0G7m4vUOQh1mxXfh1Z5rGm2b8WxGN9m8YrUF9Hy'), -- 123456
('stivensg04182@gmail.com', '$2a$10$pB.2OG0vxpqVBmv.4LK3/.9Yf/0YwLZA9q3X8VZ9X9Z1X9Z1X9Z1X'); -- 987654

-- Create default settings for new users
INSERT INTO user_settings (user_id, dark_mode, voice_enabled)
SELECT id, true, true
FROM users
WHERE email IN ('biblioteca9101@sena.edu.co', 'stivensg04182@gmail.com')
AND NOT EXISTS (
    SELECT 1 FROM user_settings WHERE user_id = users.id
);