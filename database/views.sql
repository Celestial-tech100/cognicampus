USE cognicampus;
-- ==========================================
-- VIEW 1: Overall Placement Overview
-- ==========================================
CREATE OR REPLACE VIEW vw_placement_overview AS
SELECT s.graduation_year,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(
        DISTINCT CASE
            WHEN p.is_placed = 1 THEN s.student_id
        END
    ) AS placed_students,
    COUNT(
        DISTINCT CASE
            WHEN p.is_placed = 0
            OR p.is_placed IS NULL THEN s.student_id
        END
    ) AS unplaced_students,
    ROUND(
        COUNT(
            DISTINCT CASE
                WHEN p.is_placed = 1 THEN s.student_id
            END
        ) * 100.0 / NULLIF(COUNT(DISTINCT s.student_id), 0),
        2
    ) AS placement_rate,
    ROUND(
        AVG(
            CASE
                WHEN p.is_placed = 1 THEN s.cgpa
            END
        ),
        2
    ) AS average_placed_cgpa,
    ROUND(
        AVG(
            CASE
                WHEN p.is_placed = 1 THEN p.best_package
            END
        ),
        2
    ) AS average_package_lpa
FROM students s
    LEFT JOIN (
        SELECT student_id,
            MAX(
                CASE
                    WHEN placement_status = 'Placed' THEN 1
                    ELSE 0
                END
            ) AS is_placed,
            MAX(
                CASE
                    WHEN placement_status = 'Placed' THEN package_lpa
                END
            ) AS best_package
        FROM placements
        GROUP BY student_id
    ) p ON s.student_id = p.student_id
GROUP BY s.graduation_year;
-- ==========================================
-- VIEW 2: Branch-wise Placement Performance
-- ==========================================
CREATE OR REPLACE VIEW vw_branch_performance AS
SELECT b.branch_id,
    b.branch_name,
    s.graduation_year,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(
        DISTINCT CASE
            WHEN p.is_placed = 1 THEN s.student_id
        END
    ) AS placed_students,
    ROUND(
        COUNT(
            DISTINCT CASE
                WHEN p.is_placed = 1 THEN s.student_id
            END
        ) * 100.0 / NULLIF(COUNT(DISTINCT s.student_id), 0),
        2
    ) AS placement_rate,
    ROUND(AVG(s.cgpa), 2) AS average_branch_cgpa,
    ROUND(
        AVG(
            CASE
                WHEN p.is_placed = 1 THEN s.cgpa
            END
        ),
        2
    ) AS average_placed_cgpa,
    ROUND(
        AVG(
            CASE
                WHEN p.is_placed = 1 THEN p.best_package
            END
        ),
        2
    ) AS average_package_lpa
FROM students s
    INNER JOIN branches b ON s.branch_id = b.branch_id
    LEFT JOIN (
        SELECT student_id,
            MAX(
                CASE
                    WHEN placement_status = 'Placed' THEN 1
                    ELSE 0
                END
            ) AS is_placed,
            MAX(
                CASE
                    WHEN placement_status = 'Placed' THEN package_lpa
                END
            ) AS best_package
        FROM placements
        GROUP BY student_id
    ) p ON s.student_id = p.student_id
GROUP BY b.branch_id,
    b.branch_name,
    s.graduation_year;
-- ==========================================
-- VIEW 3: Student-wise Placement Details
-- ==========================================
CREATE OR REPLACE VIEW vw_student_placement_details AS
SELECT s.student_id,
    s.student_name,
    b.branch_name,
    s.cgpa,
    s.graduation_year,
    CASE
        WHEN p.is_placed = 1 THEN 'Placed'
        ELSE 'Not Placed'
    END AS placement_result,
    p.best_package AS best_package_lpa
FROM students s
    INNER JOIN branches b ON s.branch_id = b.branch_id
    LEFT JOIN (
        SELECT student_id,
            MAX(
                CASE
                    WHEN placement_status = 'Placed' THEN 1
                    ELSE 0
                END
            ) AS is_placed,
            MAX(
                CASE
                    WHEN placement_status = 'Placed' THEN package_lpa
                END
            ) AS best_package
        FROM placements
        GROUP BY student_id
    ) p ON s.student_id = p.student_id;