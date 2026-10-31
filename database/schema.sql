
-- database/schema.sql

CREATE DATABASE IF NOT EXISTS cognicampus;
USE cognicampus;

CREATE TABLE IF NOT EXISTS branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(150) NOT NULL,
    branch_id INT NOT NULL,
    cgpa DECIMAL(4,2),
    graduation_year YEAR NOT NULL,
    gender VARCHAR(20),

    CONSTRAINT fk_student_branch
        FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id),

    CONSTRAINT chk_cgpa
        CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10)),

    INDEX idx_student_branch (branch_id),
    INDEX idx_graduation_year (graduation_year)
);

CREATE TABLE IF NOT EXISTS placements (
    placement_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    job_role VARCHAR(150),
    package_lpa DECIMAL(8,2),
    placement_date DATE,
    placement_status VARCHAR(30) NOT NULL DEFAULT 'Pending',

    CONSTRAINT fk_placement_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id),

    CONSTRAINT chk_package
        CHECK (package_lpa IS NULL OR package_lpa >= 0),

    INDEX idx_placement_student (student_id),
    INDEX idx_placement_status (placement_status),
    INDEX idx_placement_date (placement_date)
);
