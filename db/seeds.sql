INSERT INTO department (name)
VALUES ("HR"),
       ("Management"),
       ("Electronics"), 
       ("Market"), 
       ("General Merchandise");

 INSERT INTO role (title, department_id, salary)      
 VALUES ("Recruiter", 1, 60000), 
        ("Director", 1, 90000), 
        ("Electronics Lead", 2, 80000), 
        ("Market Lead", 2, 75000),
        ("GM Lead", 2, 80000),
        ("Electronics Advocate", 3, 40000),
        ("Market Advocate", 4, 35000),
        ("Cashier", 5, 35000),
        ("Stocker", 5, 35000); 

 INSERT INTO employee (first_name, last_name, role_id, manager_id)
 VALUES ("Jon", "Brown", 2, NULL), 
        ("James", "White", 1, 1),  
        ("Juan", "Blue", 3, 1), 
        ("Joana", "Sliver", 4, 1),  
        ("Joe", "Green", 5, 1),
        ("Jazz", "Blue", 6, 3), 
        ("Jane", "Cyan", 7, 4), 
        ("Jenny", "Purple", 8, 5),  
        ("Josie", "Pink", 9, 5);         