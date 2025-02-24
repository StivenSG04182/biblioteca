CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recovery_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  content VARCHAR(1000),
  content_type VARCHAR(50) CHECK (content_type IN ('pdf', 'video', 'audio', 'youtube', 'image')),
  file_path VARCHAR(1000),
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TABLE media_files (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  file_path VARCHAR(1000) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_questions (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id),
  dark_mode BOOLEAN DEFAULT TRUE,
  voice_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE visits (
  id SERIAL PRIMARY KEY,
  visitor_ip VARCHAR(45),
  visit_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(visitor_ip, visit_date)
);

CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Modificar la inserción de usuarios para usar bcrypt y dejar que SERIAL maneje los IDs
INSERT INTO users (email, password, created_at) 
VALUES 
('biblioteca9101@sena.edu.co', '$2a$10$SQZ05Sr9RKw9MBKLdnQsZ.QwoIxINNsFUKl296i0NzCXTd2uzU/gm', CURRENT_TIMESTAMP),
('stivensg04182@gmail.com', '$2a$10$SQZ05Sr9RKw9MBKLdnQsZ.QwoIxINNsFUKl296i0NzCXTd2uzU/gm', CURRENT_TIMESTAMP);