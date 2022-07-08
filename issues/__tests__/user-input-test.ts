import { VerySimpleDatabase, savePassword, saveAge } from '../user-input'

describe('user-input', () => {
    let mockDatabase : VerySimpleDatabase
    let mockHttpPostParams: Record<string, string>
    
    beforeEach(() => {
        mockDatabase = {
            insert: jest.fn(() => Promise.resolve()),
        };
        mockHttpPostParams = {password: 'test', age: '20'}
    });

    test('save password', () => {
      savePassword(mockDatabase, mockHttpPostParams)

      expect(mockDatabase.insert).toHaveBeenCalledWith('password', 'test')
    });
  
    test('save age', () => {
        saveAge(mockDatabase, mockHttpPostParams)

        expect(mockDatabase.insert).toHaveBeenCalledWith('age', 20)
      });
      
});