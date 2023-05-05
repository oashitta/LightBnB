const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

const properties = require("./json/properties.json");
const users = require("./json/users.json");


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {

  const queryString = `SELECT id, name, email, password
                      FROM users
                      WHERE email = $1;`

  return pool
    .query(queryString, [email])
    .then(result => {
      const user = result.rows[0];
      if (!user) {
        return null;
      }
      return user;
    })
    .catch((err) => {
      console.log(err.message);
    })
  
    // code for in app data connection.
  // let resolvedUser = null;
  // for (const userId in users) {
  //   const user = users[userId];
  //   if (user?.email.toLowerCase() === email?.toLowerCase()) {
  //     resolvedUser = user;
  //   }
  // }
  // return Promise.resolve(resolvedUser);
};


/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  const queryString = `SELECT id, name, email, password
                      FROM users
                      WHERE id = $1;`

  return pool
    .query(queryString, [id])
    .then(result => {
      const user = result.rows[0];
      if (!user) {
        return null;
      }
      return user;
    })
    .catch((err) => {
      console.log(err.message);
    })
  // return Promise.resolve(users[id]);
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const queryString = `INSERT INTO users (name, email, password)
                      VALUES ($1, $2, $3)
                      RETURNING *;`
  const values = [user.name, user.email, user.password];
  return pool
    .query(queryString, values)
    .then(result => {
      const newUser = result.rows[0];
      if (!newUser) {
        return null;
      }
      return newUser;
    })
    .catch((err) => {
      console.log(err.message);
    })
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `SELECT reservations.*, properties.*, AVG(property_reviews.rating)
  FROM reservations
  JOIN properties 
  ON reservations.property_id = properties.id
  JOIN property_reviews 
  ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.title, reservations.start_date, properties.cost_per_night, properties.id
  ORDER BY start_date ASC
  LIMIT $2;`

  const values = [guest_id, limit];

  return pool
    .query(queryString, values)
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });

  // return getAllProperties(null, 2);
};

/// Properties


const getAllProperties = function (options, limit = 4) {
  // 1
  const queryParams = [];
  // 2
  let queryString = 
  `SELECT properties.*, avg(property_reviews.rating) as average_rating 
  FROM properties 
  JOIN property_reviews ON properties.id = property_id
  WHERE 1 = 1
  `;

  // if option of city is provided
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND city LIKE $${queryParams.length}`;
  }

  // if owner id is provided
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`)
    queryString += `AND owner_id = $${queryParams.length}\n`;
  }

  // if minimum and maximum price per night are provided
  if (options.minimum_price_per_night && options.maximum_price_per_night){
    const min_price = options.minimum_price_per_night * 100;
    const max_price = options.maximum_price_per_night * 100;

    queryParams.push(min_price);
    queryParams.push(max_price);

    queryString += `AND (cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length})\n`;

  } else if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    queryString += `AND (cost_per_night >= $${queryParams.length -1})`;

  } else if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `AND (cost_per_night <= $${queryParams.length})`;
  }
  
  queryString += 
  `GROUP BY properties.id\n` 

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += 
    `HAVING avg(rating) >= $${queryParams.length}\n`;

    // `HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }

  // limit = 4; // for testing
  queryParams.push(limit);
  queryString += 
  `ORDER BY cost_per_night
  LIMIT $${queryParams.length};`;

  // console.log(queryString, queryParams);
  
  console.log('this is queryParams', queryParams);
  return pool
    .query(queryString, queryParams)
    .then((result) => {
      // console.log(result.rows);
      // console.log(result);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });

  // const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  //   limitedProperties[i] = properties[i];
  // }
  // return Promise.resolve(limitedProperties);
};




/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// const getAllProperties = function (options, limit) {
//   // 1
//   const queryParams = [];
//   // 2
//   let queryString = 
//   `SELECT properties.*, avg(property_reviews.rating) as average_rating 
//   FROM properties 
//   LEFT JOIN property_reviews 
//   ON properties.id = property_id
//   `;

//   // if option of city is provided
//   if (options.city) {
//     queryParams.push(`%${options.city}%`);
//     queryString += `WHERE city LIKE $${queryParams.length} `;
//   }

//   // if owner id is provided
//   if (options.owner_id) {
//     queryParams.push(`${options.owner_id}`);
//     queryString += `${queryParams.length === 1 ? 'WHERE' : 'AND'} owner_id = $${queryParams.length} `;
//   }

//   // if minimum and maximum price per night are provided
//   if (options.minimum_price_per_night && options.maximum_price_per_night){
//     const min_price = options.minimum_price_per_night * 100;
//     const max_price = options.maximum_price_per_night * 100;

//     queryParams.push(`${min_price}`);
//     queryParams.push( `${max_price}`);

//     queryString += `${queryParams.length === 2 ? 'WHERE' : 'AND'} cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `;

//   } else if (options.minimum_price_per_night) {
//     queryParams.push(`${options.minimum_price_per_night}`);
//     queryString += `${queryParams.length === 1 ? 'WHERE' : 'AND'} cost_per_night >= $${queryParams.length} `;

//   } else if (options.maximum_price_per_night) {
//     queryParams.push(`${options.maximum_price_per_night}`);
//     queryString += `${queryParams.length === 1 ? 'WHERE' : 'AND'} cost_per_night <= $${queryParams.length} `;
//   }

//   if (options.minimum_rating) {
//     queryParams.push(`${options.minimum_rating}`);
//     queryString += 
//     `${queryParams.length === 1 ? 'WHERE' : 'AND'} property_reviews.rating >= $${queryParams.length} `;

//     // `HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
//   }

//   queryString += 
//   `GROUP BY properties.id ` 

  
//   queryParams.push(limit);
//   queryString += 
//   `ORDER BY cost_per_night
//   LIMIT $${queryParams.length}`;

//   // console.log(queryString, queryParams);

//   return pool
//     .query(queryString, queryParams)
//     .then((result) => {
//       // console.log(result.rows);
//       console.log(result);
//       return result.rows;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });

//   // const limitedProperties = {};
//   // for (let i = 1; i <= limit; i++) {
//   //   limitedProperties[i] = properties[i];
//   // }
//   // return Promise.resolve(limitedProperties);
// };

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
