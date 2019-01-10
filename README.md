# vCaptcha-stateless

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

### Usage

```js
// INITIALIZE
const vCaptcha = require('vcaptcha')({ 
  secret: 'secret',
  maxFails: 10
});

// CREATE A NEW CAPTCHA
const captcha = vCaptcha.create({
  userId: '192.168.1.30', // unique ID of your choice
  language: 'fr', // 'en' or 'fr'
  length: 5,
  expiresIn: 60 // for 1 minute
});

// SOLVE CAPTCHA
vCaptcha.solve({
  key: body.key,
  solution: body.solution
}, (valid, captcha) => {
  if (valid) {
    // user completed the captcha
    // captcha = undefined
  } else {
    // if maxFails is not reached, captcha = a new captcha
    // if maxFails is reached, captcha = null
  }
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
