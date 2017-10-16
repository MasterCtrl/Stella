module.exports = function(testCase) {
    console.log = () => {};
    var result = testCase();
    delete console.log;
    return result;
};