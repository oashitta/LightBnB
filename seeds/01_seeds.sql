INSERT INTO users (name, email, password)
VALUES ('mot', 'mot@mail', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'), ('you', 'you@mail', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'), ('we', 'we@mail', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u');

INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active )
VALUES (1, 'property1', 'description', 'thumbnail_url', 'cover image', 500, 2, 3, 2, 'canada', 'king street', 'toronto', 'ontario', 'N3E 24L', true), 

(2, 'property2', 'description', 'thumbnail_url', 'cover image', 500, 2, 3, 2, 'united kingdom', 'Queen street', 'thames', 'London', 'N44 24L', true), 

(3, 'property3', 'description', 'thumbnail_url', 'cover image', 500, 2, 3, 2, 'nigeria', 'lords street', 'kitchener', 'ontario', 'N3E 24L', true);


INSERT INTO reservations (start_date, end_date, property_id, guest_id)
VALUES ('2018-09-11', '2018-09-26', 1, 1),
('2019-01-04', '2019-02-01', 2, 2),
('2021-10-01', '2021-10-14', 3, 3);

INSERT INTO property_reviews (guest_id, property_id, reservation_id, rating, message)
VALUES (2, 1, 3, 4, 'text'),
(3, 2, 2, 5, 'some text'), 
(1, 3, 1, 3, 'some more text');
