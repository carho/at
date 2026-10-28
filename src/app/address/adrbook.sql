CREATE DATABASE addressbook;

CREATE TABLE addresses (
                         id SERIAL PRIMARY KEY,
                         first_name VARCHAR(100) NOT NULL,
                         last_name VARCHAR(100) NOT NULL,
                         email VARCHAR(150) NOT NULL,
                         phone VARCHAR(50),
                         street VARCHAR(255),
                         city VARCHAR(100),
                         zip_code VARCHAR(10)
);
