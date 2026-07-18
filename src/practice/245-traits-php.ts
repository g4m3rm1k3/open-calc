import type { PracticeChallenge } from './loader'

export const title = 'Traits (PHP)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Write `trait Describable` with `public function describe() { return "This is " . $this->title; }`. Write `class Book` with `use Describable;`, a `$title` property, and a constructor. Create `$novel = new Book("Dune")`, echo `$novel->describe()` — working even though `describe` is entirely defined in the trait. Echo `get_class($novel)` — reports just `"Book"`, with no trace of the trait, since `use` FLATTENS the trait\'s methods directly into the class.',
        starter: '',
        tests: `
assert output === 'This is Dune\\nBook'
`,
        solution: `<?php
trait Describable {
    public function describe() {
        return "This is " . $this->title;
    }
}

class Book {
    use Describable;
    public $title;
    public function __construct($title) {
        $this->title = $title;
    }
}

$novel = new Book("Dune");
echo $novel->describe() . "\\n";
echo get_class($novel) . "\\n";
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Fix `Account`: `use Basic, Premium;` combines two traits that BOTH define `rate()`, with no conflict-resolution block — PHP raises a FATAL ERROR ("Trait method rate has not been applied, because there are collisions") rather than silently picking one. Resolve it explicitly with `use Basic, Premium { Premium::rate insteadof Basic; }`, telling PHP that `Premium`\'s version wins.',
        starter: `<?php
trait Basic {
    public function rate() {
        return "basic rate: 5%";
    }
}

trait Premium {
    public function rate() {
        return "premium rate: 15%";
    }
}

class Account {
    use Basic, Premium;
}

$acc = new Account();
echo $acc->rate() . "\\n";
`,
        tests: `
assert output === 'premium rate: 15%'
`,
        solution: `<?php
trait Basic {
    public function rate() {
        return "basic rate: 5%";
    }
}

trait Premium {
    public function rate() {
        return "premium rate: 15%";
    }
}

class Account {
    use Basic, Premium {
        Premium::rate insteadof Basic;
    }
}

$acc = new Account();
echo $acc->rate() . "\\n";
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Using the same `Basic`/`Premium` traits, resolve the conflict with BOTH `insteadof` AND `as`: `use Basic, Premium { Premium::rate insteadof Basic; Basic::rate as basicRate; }` — `Premium`\'s `rate()` wins the name, while `Basic`\'s version is kept accessible under the new alias `basicRate()`. Call and echo both `$acc->rate()` and `$acc->basicRate()`.',
        starter: '',
        tests: `
assert output === 'premium rate: 15%\\nbasic rate: 5%'
`,
        solution: `<?php
trait Basic {
    public function rate() {
        return "basic rate: 5%";
    }
}

trait Premium {
    public function rate() {
        return "premium rate: 15%";
    }
}

class Account {
    use Basic, Premium {
        Premium::rate insteadof Basic;
        Basic::rate as basicRate;
    }
}

$acc = new Account();
echo $acc->rate() . "\\n";
echo $acc->basicRate() . "\\n";
`,
      },
    ],
  },
]

export default challenges
