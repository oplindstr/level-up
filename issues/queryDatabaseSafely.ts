/*
 I don't know of any more security issues here. It seems to me that Query interface is meant to hold (field,value) pairs that 
 are compared directly with the database values. For example, if you try to inject malicious queries into the values, 
 the whole injected query string is just compared with the database values.
*/
export interface Query {
  [field: string]: string | number | Date;
}

export interface Database {
  /**
   * Query database records by exact field match
   */
  query(query: Query): unknown;
}

/**
 * Perform safe database query
 *
 * This function ensures that the query returns only
 * database records that are available for currently
 * authenticated user.
 */
export default function queryDatabaseSafely(
  query: Query,
  database: Database,
  authenticatedUserId: string
) {
  let finalQuery = {};

  console.log(query)

  if (Object.keys(query).length) {
    // Fetch only records where "userId" field matches with currently
    // authenticated user ID.
    finalQuery = {
      userId: authenticatedUserId,
    };
  }

  // Switched the order of query and finalQuery in this assign. You could override authenticated user id by giving it in the query before.
  finalQuery = { ...query, ...finalQuery };

  return database.query(finalQuery);
}
