import queryDatabaseSafely from '../queryDatabaseSafely';
import { Query, Database } from '../queryDatabaseSafely'

describe('queryDatabaseSafely', () => {
  let mockQuery : (query: Query) => unknown;
  let mockDatabase : Database;
  
  beforeEach(() => {
    mockQuery = jest.fn(() => [{ name: 'John' }]);
    mockDatabase = {
      query: mockQuery,
    };
  });

  test('query with one field', () => {

    expect(
      queryDatabaseSafely({ name: 'John' }, mockDatabase, 'user-123')
    ).toEqual([{ name: 'John' }]);

    expect(mockQuery).toHaveBeenCalledWith({
      name: 'John',
      userId: 'user-123',
    });
  });

  test('query with userId override attempt', () => {

    expect(
      queryDatabaseSafely({ name: 'John', userId: 'user-456' }, mockDatabase, 'user-123')
    ).toEqual([{ name: 'John' }]);

    expect(mockQuery).toHaveBeenCalledWith({
      name: 'John',
      userId: 'user-123',
    });
  });

  test('empty query', () => {

    expect(
      queryDatabaseSafely({}, mockDatabase, 'user-123')
    ).toEqual([{ name: 'John' }]);

    expect(mockQuery).toHaveBeenCalledWith({
    });
  });
});
