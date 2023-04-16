
// Import and require mysql2
const mysql = require('mysql2');
const inquirer = require('inquirer');
const { exit } = require('process');

const showMenu = true; 

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // MySQL password
    password: '',
    database: 'company_db'
  },
  console.log(`Connected to the company database.`)
);


async function getDepartments(){
    let info = []; 
    await db.promise().query('select * from department')
    .then( ([rows,fields]) => {
      info = rows; 
    })
    .catch(console.log);  
    return info; 
}

async function viewDepartments(){
    let departments = await getDepartments(); 
    const transformed = departments.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {}); 
    console.table(transformed);
    menu();    
}

async function getRoles(){
  let info = []; 
  await db.promise().query(`SELECT role.id, role.title, role.salary, department.name
  AS department
  FROM role
  LEFT JOIN department
  ON role.department_id = department.id`)
  .then( ([rows, fields]) => {
    info = rows; 
    // const transformed = rows.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {})
    // console.table(transformed);
  })
  .catch(console.log); 
  return info; 
}

async function viewRoles(){
  let roles = await getRoles(); 
  const transformed = roles.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {}); 
  console.table(transformed);
  menu();    
}

async function getEmployees(){
  let info = []; 
  const query = `select employee.id, employee.first_name, employee.last_name, role.title, 
                  role.salary, department.name, manager.first_name as manager_first_name, manager.last_name as manager_last_name 
                  from employee 
                  inner join role on role.id = employee.role_id 
                  inner join department on department.id = role.department_id
                  inner join employee as manager on manager.id = employee.manager_id`;             
  await db.promise().query(query)
  .then( ([rows, fields]) => {
    info = rows; 
    // const transformed = rows.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {})
    // console.table(transformed);
  })
  .catch(console.log); 
  return info; 
  //menu(); 
}

async function viewEmployees(){
  let employees = await getEmployees(); 
  const transformed = employees.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {}); 
  console.table(transformed);
  menu()
}
async function addDepartment(){
  const department_questions = [ 
    {
      type: "input",
      name: "department",
      message: "What is the name of the new department?",
 
    },
  ]; 

  await inquirer
  .prompt(department_questions)
  .then( async (response) => {
    console.clear(); 
    await db.promise().query(`insert into department (name) values ('${response.department}')`)
    .then( ([rows,fields]) => {
      console.log(`Added Department ${response.department}`); 
    })
    .catch(console.log);  
    menu();  
}); 
}
async function addRole(){
  let departments = await getDepartments(); 
  
  const role_questions = [ 
    {
      type: "input",
      name: "role",
      message: "What is the name of the new role?",
    },
    {

      type: "list",
      name: "department",
      message: "What department does this role belong too?",
      choices: departments,
      loop: false, 
    },
    {
      type: "input",
      name: "salary",
      message: "What is the salary of this role?",
    },
  ]; 

  await inquirer
  .prompt(role_questions)
  .then( async (response) => {
    console.clear(); 
    const query = `insert into role (title, department_id, salary) select "${response.role}", 
                  department.id, ${response.salary} from department where department.name = "${response.department}"`;
    await db.promise().query(query)
    .then( ([rows,fields]) => {
      console.log(`Added Department ${response.role}`); 
    })
    .catch(console.log);  
  }); 
  menu();  
}

async function addEmployee(){

  let roles = await getRoles(); 
  role_titles = roles.map(( {title} ) => title)
  let employees = await getEmployees(); 
  employee_names = employees.map(({first_name, last_name}) => first_name+' '+last_name);

  const employee_questions = [ 
    {
      type: "input",
      name: "first",
      message: "What is the first name of the new employee?",
    },
    {
      type: "input",
      name: "last",
      message: "What is the last name of the new employee?",
    },
    {
      type: "list",
      name: "role",
      message: "What role will this employee have?",
      choices: role_titles,
      loop: false,
    },
    {
      type: "list",
      name: "manager",
      message: "Who is the manager for this new employee?",
      choices: employee_names,
      loop: false, 
    },
  ]; 
 

  await inquirer
  .prompt(employee_questions)
  .then( async (response) => {
    console.clear(); 
    const query = `insert into employee (first_name, last_name, role_id, manager_id) select "${response.first}",   
    "${response.last}", role.id, manager.id 
    from role 
    join employee as manager
    where role.title = "${response.role}"
    and manager.first_name = "${response.manager.split(" ")[0]}" 
    and manager.last_name =  "${response.manager.split(" ")[1]}"`;
    await db.promise().query(query)
          .then( ([rows,fields]) => {
             console.log(`Added employee ${response.first} ${response.last}`); 
           })
          .catch(console.log); 
  }); 
  menu(); 
}



async function updateEmpolyeeRole(){
  let roles = await getRoles(); 
  role_titles = roles.map(( {title} ) => title)
  let employees = await getEmployees(); 
  employee_names = employees.map(({first_name, last_name}) => first_name+' '+last_name);
  
  const update_questions = [ 
    {
      type: "list",
      name: "employee",
      message: "What employees role would you like to update?",
      choices: employee_names, 
      loop: false,
    },
    {
      type: "list",
      name: "role",
      message: "What role would you like this employee to?",
      choices: role_titles, 
      loop: false,
    },
  ]; 

  await inquirer
  .prompt(update_questions)
  .then( async (response) => {
    console.clear(); 
    query = `UPDATE
              employee,
              role
              SET
              employee.role_id = role.id
              WHERE
              employee.first_name = "${response.employee.split(" ")[0]}"
              AND 
              employee.last_name = "${response.employee.split(" ")[1]}"
              AND 
              role.title = "${response.role}";`;
    await db.promise().query(query)
    .then( ([rows,fields]) => {
       console.log(`Updated employee ${response.employee } to role ${response.role}`); 
     })
    .catch(console.log); 
    menu(); 
  }); 

}

function menuOption(menu_choice){
  choice = Number(menu_choice.split(".")[0]); 
  
  switch (choice) {
    case 1: 
      viewDepartments(); 
      break;
    case 2: 
      viewRoles();  
      break;
    case 3:
      viewEmployees(); 
      break;
    case 4:
      addDepartment(); 
      break;
    case 5:
      addRole();    
      break;
    case 6:
      addEmployee(); 
      break;
    case 7:
      updateEmpolyeeRole(); 
      break;
    case 8:
      db.end(); 
      exit(); 
  
  }
}

async function menu() {
  //while (showMenu){
    const menu_options = [ 
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          "1. View all departments",
          "2. View all roles",
          "3. View all employees", 
          "4. Add a department", 
          "5. Add a role", 
          "6. Add an employee", 
          "7. Update an employee role",
          "8. Quit", 
          ],
        loop: false,
      },
    ]; 

    inquirer
    .prompt(menu_options)
    .then( (response) => {
      console.clear(); 
      menuOption(response.menu); 
  }); 
  //}
}


menu();