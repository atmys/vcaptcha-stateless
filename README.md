# vCaptcha-stateless

[![Build Status](https://travis-ci.org/atmys/vcaptcha-stateless.svg?branch=master)](https://travis-ci.org/atmys/vcaptcha-stateless)
[![Coverage Status](https://coveralls.io/repos/github/atmys/vcaptcha-stateless/badge.svg?branch=master)](https://coveralls.io/github/atmys/vcaptcha-stateless?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/atmys/vcaptcha-stateless/badge.svg?targetFile=package.json)](https://snyk.io/test/github/atmys/vcaptcha-stateless?targetFile=package.json)
[![codebeat badge](https://codebeat.co/badges/07d42dde-a515-46b1-a63c-901dae71ac14)](https://codebeat.co/projects/github-com-atmys-vcaptcha-stateless-master)

Simple but user-friendy Node.js stateless captcha generator, based on [vCAPTCHA](https://github.com/atmys/vcaptcha). It makes the user pick up 2 pictures (in sequence) among several (5 by default). Should be enough for low security forms.

WARNING : this stateless version can only be used if captcha requests are somehow limited, for example with nginx or iptables, and the request rate must match the expiresIn parameter you provide. Otherwise, the client will be able to use the same captcha over and over, making it useless. To avoid this, please use the original stateful version of [vCAPTCHA](https://github.com/atmys/vcaptcha).

------------------

![vCAPTCHA preview](https://github.com/atmys/vcaptcha-stateless/raw/master/preview.jpg)

------------------

## Getting Started

What it does :
- generate base64 pictures to display in the client;
- generate a phrase to help you pick up the right pictures;
- generate pictures names only if you want a custom phrase;
- generate a key, which is simply the encoded solution.

All this data must be passed to the client. The key must be sent back to the server along with the guessed solution.

### Install

```
npm i --save vcaptcha-stateless
```

### API
#### `require('vcaptcha')(options)`
- Initialize vCaptcha
- `options <Object>` 
  - `secret` **Required:** JWT secret
  - `maxFails` **Default:** 10 - max fails allowed per userId
#### `create(options, callback)`
- `options <Object>` 
  - `userId` **Default:** ''
  - `expiresIn` **Default:** 60 - seconds
  - `language` **Default:** 'en' - also supported: 'fr'
  - `length` **Default:** 5 - number of pictures to send to the client
  - `failCount` **Default:** 0 - current fail count - set automatically
- returns `{ key, data, names, phrase }`
  - `captcha <Object>`
    - `key` JWT token containing the captcha data
    - `data` base64 pictures array
    - `phrase` explanation to solve the captcha
    - `names` pictures to find to solve the captcha, to create your own phrase
  - `count` fail count
#### `solve(options, callback)`
- `options <Object>` 
  - `key` **Required:** key of the captcha to solve
  - `solution` **Required:** guessed solution provided by the client.
- `callback <Function>` returns `(valid, newCaptcha)`
  - `valid <Boolean>` whether or not captcha is solved
  - `newCaptcha <Object>` if validation failed.

### Example

Try it on [RunKit](https://runkit.com/atmys/vcaptcha-stateless).

```js
const vCaptcha = require('vcaptcha-stateless')({ 
  secret: 'secret'
});

const captcha = vCaptcha.create();

vCaptcha.solve({
  key: captcha.key,
  solution: captcha.solution
}, (valid, newCaptcha) => {
  // if (valid) newCaptcha = undefined
});
```

### Client use

Example with Angular template.

```html
<div class="captcha">
  <h5 *ngIf="error">Too many fails, come back later.</h5>
  <div *ngIf="!error" class="captcha-box">
    <label><span>{{ captcha.phrase }}</span></label>
    <ul class="thumbnails selector">
      <li *ngFor="let src of captcha.data; let i = index">
        <div class="thumbnail" [class.selected]="isSelected(i)" (click)="toggleSelect(i)">
          <img class="image" [src]="'data:image/png;base64,'+ src">
        </div>
      </li>
    </ul>
  </div>
</div>
```

### Credit

Pictures are taken from deprecated [VisualCaptcha](https://github.com/desirepath41/visualCaptcha).
