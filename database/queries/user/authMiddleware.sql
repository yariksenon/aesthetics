SELECT u.id, u.role
FROM session s
         JOIN users u ON s.user_id = u.id
WHERE s.session_token = $1