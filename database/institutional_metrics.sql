SELECT COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(
        DISTINCT CASE
            WHEN p.student_id IS NOT NULL THEN s.student_id
        END
    ) AS placed_students,
    ROUND(
        COUNT(DISTINCT p.student_id) * 100.0 / NULLIF(COUNT(DISTINCT s.student_id), 0),
        2
    ) AS placement_rate_percentage
FROM students s
    LEFT JOIN (
        SELECT DISTINCT student_id
        FROM placements
        WHERE placement_status = 'Placed'
    ) p ON s.student_id = p.student_id
WHERE s.graduation_year = 2026;
SELECT b.branch_name,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(DISTINCT p.student_id) AS placed_students,
    ROUND(
        COUNT(DISTINCT p.student_id) * 100.0 / NULLIF(COUNT(DISTINCT s.student_id), 0),
        2
    ) AS placement_percentage
FROM branches b
    JOIN students s ON s.branch_id = b.branch_id
    LEFT JOIN (
        SELECT DISTINCT student_id
        FROM placements
        WHERE placement_status = 'Placed'
    ) p ON p.student_id = s.student_id
WHERE s.graduation_year = 2026
GROUP BY b.branch_id,
    b.branch_name
ORDER BY placement_percentage DESC;
SELECT ROUND(AVG(s.cgpa), 2) AS average_placed_cgpa,
    COUNT(DISTINCT s.student_id) AS placed_students
FROM students s
WHERE EXISTS (
        SELECT 1
        FROM placements p
        WHERE p.student_id = s.student_id
            AND p.placement_status = 'Placed'
    );
SELECT b.branch_name,
    COUNT(s.student_id) AS total_students,
    ROUND(AVG(s.cgpa), 2) AS average_cgpa,
    ROUND(MAX(s.cgpa), 2) AS highest_cgpa,
    ROUND(MIN(s.cgpa), 2) AS lowest_cgpa
FROM branches b
    LEFT JOIN students s ON s.branch_id = b.branch_id
GROUP BY b.branch_id,
    b.branch_name
ORDER BY average_cgpa DESC;
SELECT b.branch_name,
    ROUND(AVG(p.best_package), 2) AS average_package_lpa,
    ROUND(MAX(p.best_package), 2) AS highest_package_lpa,
    ROUND(MIN(p.best_package), 2) AS lowest_package_lpa,
    COUNT(p.student_id) AS placed_students
FROM branches b
    JOIN students s ON s.branch_id = b.branch_id
    JOIN (
        SELECT student_id,
            MAX(package_lpa) AS best_package
        FROM placements
        WHERE placement_status = 'Placed'
            AND package_lpa IS NOT NULL
        GROUP BY student_id
    ) p ON p.student_id = s.student_id
GROUP BY b.branch_id,
    b.branch_name
ORDER BY average_package_lpa DESC;
SELECT company_name,
    COUNT(DISTINCT student_id) AS students_placed,
    ROUND(AVG(package_lpa), 2) AS average_package_lpa,
    ROUND(MAX(package_lpa), 2) AS highest_package_lpa
FROM placements
WHERE placement_status = 'Placed'
GROUP BY company_name
ORDER BY students_placed DESC
LIMIT 10;
SELECT CASE
        WHEN cgpa >= 9.0 THEN '9.0 - 10.0'
        WHEN cgpa >= 8.0 THEN '8.0 - 8.99'
        WHEN cgpa >= 7.0 THEN '7.0 - 7.99'
        WHEN cgpa >= 6.0 THEN '6.0 - 6.99'
        ELSE 'Below 6.0'
    END AS cgpa_range,
    COUNT(*) AS total_students,
    SUM(is_placed) AS placed_students,
    ROUND(
        SUM(is_placed) * 100.0 / NULLIF(COUNT(*), 0),
        2
    ) AS placement_percentage
FROM (
        SELECT s.student_id,
            s.cgpa,
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM placements p
                    WHERE p.student_id = s.student_id
                        AND p.placement_status = 'Placed'
                ) THEN 1
                ELSE 0
            END AS is_placed
        FROM students s
        WHERE s.graduation_year = 2026
            AND s.cgpa IS NOT NULL
    ) AS student_results
GROUP BY cgpa_range
ORDER BY MIN(cgpa) DESC;
SELECT s.graduation_year,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(DISTINCT p.student_id) AS placed_students,
    ROUND(
        COUNT(DISTINCT p.student_id) * 100.0 / NULLIF(COUNT(DISTINCT s.student_id), 0),
        2
    ) AS placement_percentage
FROM students s
    LEFT JOIN (
        SELECT DISTINCT student_id
        FROM placements
        WHERE placement_status = 'Placed'
    ) p ON p.student_id = s.student_id
GROUP BY s.graduation_year
ORDER BY s.graduation_year;
SELECT s.student_id,
    s.student_name,
    b.branch_name,
    s.cgpa,
    s.graduation_year
FROM students s
    JOIN branches b ON b.branch_id = s.branch_id
WHERE s.graduation_year = 2026
    AND NOT EXISTS (
        SELECT 1
        FROM placements p
        WHERE p.student_id = s.student_id
            AND p.placement_status = 'Placed'
    )
ORDER BY s.cgpa DESC;
SELECT DATE_FORMAT(placement_date, '%Y-%m') AS placement_month,
    COUNT(DISTINCT student_id) AS students_placed,
    COUNT(*) AS total_placement_offers,
    ROUND(AVG(package_lpa), 2) AS average_package_lpa
FROM placements
WHERE placement_status = 'Placed'
GROUP BY DATE_FORMAT(placement_date, '%Y-%m')
ORDER BY placement_month;
CREATE OR REPLACE VIEW vw_placement_overview AS
SELECT s.graduation_year,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(DISTINCT p.student_id) AS placed_students,
    ROUND(
        COUNT(DISTINCT p.student_id) * 100.0 / NULLIF(COUNT(DISTINCT s.student_id), 0),
        2
    ) AS placement_rate
FROM students s
    LEFT JOIN (
        SELECT DISTINCT student_id
        FROM placements
        WHERE placement_status = 'Placed'
    ) p ON p.student_id = s.student_id
GROUP BY s.graduation_year;
CREATE OR REPLACE VIEW vw_branch_performance AS
SELECT b.branch_name,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(DISTINCT p.student_id) AS placed_students,
    ROUND(AVG(s.cgpa), 2) AS average_cgpa,
    ROUND(
        COUNT(DISTINCT p.student_id) * 100.0 / NULLIF(COUNT(DISTINCT s.student_id), 0),
        2
    ) AS placement_rate
FROM branches b
    LEFT JOIN students s ON s.branch_id = b.branch_id
    LEFT JOIN (
        SELECT DISTINCT student_id
        FROM placements
        WHERE placement_status = 'Placed'
    ) p ON p.student_id = s.student_id
GROUP BY b.branch_id,
    b.branch_name;
SELECT *
FROM vw_placement_overview;
SELECT *
FROM vw_branch_performance;
ALTER TABLE students
ADD COLUMN placement_eligible BOOLEAN NOT NULL DEFAULT TRUE;
WHERE s.graduation_year = 2026
    AND s.placement_eligible = TRUE;