const maxFails = 5;
const vCaptchaModule = require('./index');
const vCaptcha = vCaptchaModule({
  secret: 'secret',
  maxFails: maxFails
});
const phrases = require('./phrases');

const userId = 'userId';

const solvedCaptcha = {
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VySWQiLCJleHBpcmVzSW4iOjMxNTM2MDAwMDAsImxhbmd1YWdlIjoiZnIiLCJsZW5ndGgiOjIsImZhaWxDb3VudCI6MCwiSlNPTlNvbHV0aW9uIjoiWzEsMF0iLCJpYXQiOjE1NDY5MDA1NzAsImV4cCI6NDcwMDUwMDU3MH0.nayW8RZ51Uxh7DpdODIS0IQknxScu5ujSGNbiOo6LfM',
  solution: [0, 1]
};

// beforeAll(done => {
//   done();
// });

describe('when creating', () => {

  it('should fail if missing params', () => {

    expect(function () {
      vCaptchaModule();
    }).toThrow();

    expect(function () {
      vCaptchaModule({});
    }).toThrow();

  });

  it('should return key, data & names', () => {
    const expectedLength = 2;
    const expectedLanguage = 'fr';

    const captcha = vCaptcha.create({
      userId: userId,
      language: expectedLanguage,
      length: expectedLength,
      expiresIn: 60 * 60 * 24 * 365 * 100
    });

    expect(captcha.key).toBeDefined();
    expect(captcha.data).toBeDefined();
    expect(captcha.data.length).toBe(expectedLength);
    expect(captcha.names).toBeDefined();
    expect(captcha.names.length).toBe(2);
    expect(captcha.phrase).toBe(phrases(expectedLanguage, captcha.names));

  });

  it('should return captcha if no option provided as well', () => {
    const captcha = vCaptcha.create();
    expect(captcha.key).toBeDefined();
  });
});

describe('when solving', () => {

  it('should fail if missing params', () => {

    expect(function () {
      vCaptcha.solve();
    }).toThrow();

    expect(function () {
      vCaptcha.solve({});
    }).toThrow();

    expect(function () {
      vCaptcha.solve({ key: 'key' });
    }).toThrow();

    expect(function () {
      vCaptcha.solve(solvedCaptcha);
    }).toThrow();

  });

  it('should fail if wrong params', done => {
    vCaptcha.solve({ key: solvedCaptcha.key, solution: {} }, function (valid, captcha) {
      expect(valid).toBe(false);
      expect(captcha).toBeTruthy();
      done();
    });
  });

  it('should fail if wrong solution & captcha should be null after max fails', done => {
    function forceFail(captcha, count) {
      vCaptcha.solve({ key: captcha.key, solution: [0, 2] }, function (valid, newCaptcha) {
        expect(valid).toBe(false);
        if (count < maxFails) {
          expect(newCaptcha).toBeTruthy();
          forceFail(newCaptcha, count + 1);
        } else {
          expect(newCaptcha).toBeNull();
          done();
        }
      });
    }
    forceFail(solvedCaptcha, 0);
  });

  it('should fail if wrong solution & return unlimited captcha if no userId', done => {
    function forceFail(captcha, count) {
      vCaptcha.solve({ key: captcha.key, solution: [0, 2] }, function (valid, newCaptcha) {
        expect(valid).toBe(false);
        if (count < maxFails * 2) {
          forceFail(newCaptcha, count + 1);
        } else {
          expect(newCaptcha).toBeTruthy();
          done();
        }
      });
    }
    forceFail(vCaptcha.create(), 0);
  });

  it('should fail if wrong JSON solution', done => {
    vCaptcha.solve({ key: solvedCaptcha.key, solution: JSON.stringify([0, 2]) }, function (valid, newCaptcha) {
      expect(valid).toBe(false);
      expect(newCaptcha).toBeTruthy();
      done();
    });
  });

  it('should succeed if right answer', done => {
    vCaptcha.solve({ key: solvedCaptcha.key, solution: [1, 0] }, function (valid, captcha) {
      expect(valid).toBe(true);
      expect(captcha).toBeUndefined();
      done();
    });
  });

  it('should succeed if right JSON answer', done => {
    vCaptcha.solve({ key: solvedCaptcha.key, solution: JSON.stringify([1, 0]) }, function (valid, captcha) {
      expect(valid).toBe(true);
      expect(captcha).toBeUndefined();
      done();
    });
  });
});