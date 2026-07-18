import type { PracticeChallenge } from './loader'

export const title = 'Magic Methods (PHP)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Write `class Settings` with a private `$data = []` array, `__get($name)` (returns `$this->data[$name] ?? null`), and `__set($name, $value)` (stores into `$data`). Set `$settings->theme = "dark"`, `var_dump` it and `var_dump($settings->missing)` (never set — falls back to `null`). Write `class Temperature` with `__toString()` returning `$this->celsius . " degrees C"`, and echo it directly inside a string: `"Current: $temp\\n"`.',
        starter: '',
        tests: `
assert output === 'string(4) "dark"\\nNULL\\nCurrent: 25 degrees C'
`,
        solution: `<?php
class Settings {
    private $data = [];
    public function __get($name) {
        return $this->data[$name] ?? null;
    }
    public function __set($name, $value) {
        $this->data[$name] = $value;
    }
}

$settings = new Settings();
$settings->theme = "dark";
var_dump($settings->theme);
var_dump($settings->missing);

class Temperature {
    public $celsius;
    public function __construct($celsius) { $this->celsius = $celsius; }
    public function __toString() {
        return $this->celsius . " degrees C";
    }
}

$temp = new Temperature(25);
echo "Current: $temp\\n";
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Fix `Tracker`: it declares a REAL `public $value;` property alongside `__get`/`__set` meant to track access via `$accessCount` — but `__get`/`__set` only trigger for properties that AREN\'T directly, normally accessible, so the real `$value` property bypasses them entirely, leaving `accessCount` stuck at `0`. Remove the real `public $value;` declaration and store values in a private `$data` array instead (`$this->data[$name]`), so `__get`/`__set` genuinely intercept every access.',
        starter: `<?php
class Tracker {
    public $value;
    private $accessCount = 0;

    public function __get($name) {
        $this->accessCount++;
        return $this->value;
    }
    public function __set($name, $val) {
        $this->accessCount++;
        $this->value = $val;
    }
    public function getAccessCount() {
        return $this->accessCount;
    }
}

$t = new Tracker();
$t->value = 10;
$x = $t->value;
echo $t->getAccessCount() . "\\n";
`,
        tests: `
assert output === '2'
`,
        solution: `<?php
class Tracker {
    private $data = [];
    private $accessCount = 0;

    public function __get($name) {
        $this->accessCount++;
        return $this->data[$name] ?? null;
    }
    public function __set($name, $val) {
        $this->accessCount++;
        $this->data[$name] = $val;
    }
    public function getAccessCount() {
        return $this->accessCount;
    }
}

$t = new Tracker();
$t->value = 10;
$x = $t->value;
echo $t->getAccessCount() . "\\n";
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Write `class ApiProxy` with `__call($name, $args)`, intercepting calls to METHODS that don\'t exist (distinct from `__get`/`__set`, which intercept PROPERTIES) — return `"Called " . $name . " with " . count($args) . " argument(s)"`. Call `$proxy->getUser(1)` and `$proxy->createPost("title", "body", "tags")`, echoing each result.',
        starter: '',
        tests: `
assert output === 'Called getUser with 1 argument(s)\\nCalled createPost with 3 argument(s)'
`,
        solution: `<?php
class ApiProxy {
    public function __call($name, $args) {
        return "Called " . $name . " with " . count($args) . " argument(s)";
    }
}

$proxy = new ApiProxy();
echo $proxy->getUser(1) . "\\n";
echo $proxy->createPost("title", "body", "tags") . "\\n";
`,
      },
    ],
  },
]

export default challenges
