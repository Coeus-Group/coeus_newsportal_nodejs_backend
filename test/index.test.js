const {
    testCountResults
} = require("../index");

describe("testCountResults", () => {
    test("location data inserted successfully", () => {
        expect(testCountResults()).toBe("Rows inserted");
    });
});

