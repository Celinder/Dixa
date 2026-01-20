-- Update end_users table with Dixa User IDs returned from API
-- Run this in Supabase SQL Editor after creating users via API

UPDATE end_users SET dixa_user_id = '5e7d9c01-c677-4b92-9140-d4fd51f0b8ff' WHERE email = 'emma.johnson@example.com';
UPDATE end_users SET dixa_user_id = 'aa19b3ba-235e-4743-96e1-2bb5277b4f2d' WHERE email = 'liam.chen@example.com';
UPDATE end_users SET dixa_user_id = '16d5b848-4707-49a7-ac2e-19358a11f2a3' WHERE email = 'sophia.rodriguez@example.com';
UPDATE end_users SET dixa_user_id = '9a970d26-fedb-46d6-bf8a-6d75acf99049' WHERE email = 'noah.anderson@example.com';
UPDATE end_users SET dixa_user_id = 'f24ca531-030b-4c43-8c9b-4f3c28ee2666' WHERE email = 'olivia.martinez@example.com';
UPDATE end_users SET dixa_user_id = 'a6228abc-5fc1-4f61-be43-f48ab3803100' WHERE email = 'ethan.brown@example.com';
UPDATE end_users SET dixa_user_id = '0164f9bc-e748-4151-a58d-248dfa65937c' WHERE email = 'ava.wilson@example.com';
UPDATE end_users SET dixa_user_id = '5e59349c-9cfe-49bb-8fcd-772b284e5223' WHERE email = 'mason.taylor@example.com';
UPDATE end_users SET dixa_user_id = 'cbc51266-1796-4c16-a3ec-3bf6f9a4ae33' WHERE email = 'isabella.thomas@example.com';
UPDATE end_users SET dixa_user_id = '6120b1e3-f290-49fb-ae46-2805aae29d35' WHERE email = 'james.lee@example.com';
UPDATE end_users SET dixa_user_id = '05b13699-5704-4f67-ac6c-83e20448b86a' WHERE email = 'mia.garcia@example.com';
UPDATE end_users SET dixa_user_id = 'a90a8e5c-fd07-4013-8491-030efeff1d93' WHERE email = 'benjamin.white@example.com';
UPDATE end_users SET dixa_user_id = '83ef9578-4988-4cc9-8ed3-aa14c887e6cd' WHERE email = 'charlotte.moore@example.com';
UPDATE end_users SET dixa_user_id = '2af23d24-92d7-431d-93d0-524bcd96eb9a' WHERE email = 'lucas.harris@example.com';
UPDATE end_users SET dixa_user_id = 'fbff6ae6-b827-48a5-90fe-34435b303250' WHERE email = 'amelia.martin@example.com';
UPDATE end_users SET dixa_user_id = '9054bd18-6c6d-4601-91f0-f0e9ca97a40a' WHERE email = 'oliver.thompson@example.com';
UPDATE end_users SET dixa_user_id = 'c9c0c46f-a986-467c-9d4a-06381ac72a6b' WHERE email = 'harper.davis@example.com';
UPDATE end_users SET dixa_user_id = '76782706-992b-496c-b649-1dba673512b7' WHERE email = 'elijah.lopez@example.com';
UPDATE end_users SET dixa_user_id = '9ac295ae-58be-4ca0-96ee-1291b910ed20' WHERE email = 'evelyn.clark@example.com';
UPDATE end_users SET dixa_user_id = '89a1d01f-36f9-476f-b384-94e2ca7fc162' WHERE email = 'alexander.kim@example.com';

-- Verify all users have been updated
SELECT display_name, email, dixa_user_id FROM end_users ORDER BY display_name;
