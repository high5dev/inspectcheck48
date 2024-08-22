import Database from "../../db/db";

describe('db object reducer', () => {

  it('should simplify standard object', () => {
    const oldObj = {name: "Adam", position: "test"};
    const newObj = {name: "Adam", position: "test1"};
    const response = Database().objReturnDifference(oldObj, newObj);
    expect(response).toEqual({position: "test1"});
  });

  it('should simplify object with new data', () => {
    const oldObj = {name: "Adam", position: "test"};
    const newObj = {name: "Adam", position: "test1", id: "23441325"};
    const response = Database().objReturnDifference(oldObj, newObj);
    expect(response).toEqual({position: "test1", id: "23441325"});
  });

  it('should simplify object with new data handling null', () => {
    const oldObj = {name: "Adam", position: "test"};
    const newObj = {name: "Adam", position: null, id: "23441325"};
    const response = Database().objReturnDifference(oldObj, newObj);
    expect(response).toEqual({position: null, id: "23441325"});
  });
});