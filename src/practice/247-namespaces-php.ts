import type { PracticeChallenge } from './loader'

export const title = 'Namespaces (PHP)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Declare `class Product` inside `namespace Shop\\Catalog;`, then a COMPLETELY SEPARATE `class Product` inside `namespace Shop\\Warehouse;` — each with its own `describe()`. In `namespace Main;`, import both with distinct aliases: `use Shop\\Catalog\\Product as CatalogProduct;` and `use Shop\\Warehouse\\Product as WarehouseProduct;`. Construct and echo `describe()` for both.',
        starter: '',
        tests: `
assert output === 'a catalog product\\na warehouse product'
`,
        solution: `<?php
namespace Shop\\Catalog;

class Product {
    public function describe() {
        return "a catalog product";
    }
}

namespace Shop\\Warehouse;

class Product {
    public function describe() {
        return "a warehouse product";
    }
}

namespace Main;

use Shop\\Catalog\\Product as CatalogProduct;
use Shop\\Warehouse\\Product as WarehouseProduct;

$catalogProduct = new CatalogProduct();
$warehouseProduct = new WarehouseProduct();

echo $catalogProduct->describe() . "\\n";
echo $warehouseProduct->describe() . "\\n";
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Fix `Main`: it imports BOTH `Shop\\Catalog\\Product` and `Shop\\Warehouse\\Product` under the SAME short name `Product`, with no alias — this is a FATAL ERROR ("Cannot use Shop\\Warehouse\\Product as Product because the name is already in use"). Alias the second import: `use Shop\\Warehouse\\Product as WarehouseProduct;`, so both can coexist unambiguously.',
        starter: `<?php
namespace Shop\\Catalog;

class Product {
    public function describe() {
        return "a catalog product";
    }
}

namespace Shop\\Warehouse;

class Product {
    public function describe() {
        return "a warehouse product";
    }
}

namespace Main;

use Shop\\Catalog\\Product;
use Shop\\Warehouse\\Product;

$p = new Product();
echo $p->describe() . "\\n";
`,
        tests: `
assert output === 'a catalog product'
`,
        solution: `<?php
namespace Shop\\Catalog;

class Product {
    public function describe() {
        return "a catalog product";
    }
}

namespace Shop\\Warehouse;

class Product {
    public function describe() {
        return "a warehouse product";
    }
}

namespace Main;

use Shop\\Catalog\\Product;
use Shop\\Warehouse\\Product as WarehouseProduct;

$p = new Product();
echo $p->describe() . "\\n";
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'php-program',
        prompt: 'Declare `class Invoice` inside the NESTED namespace `Company\\Billing\\Models;`, with `total()` returning `500`. In `namespace Main;`, construct it using its FULL fully-qualified name directly — `new \\Company\\Billing\\Models\\Invoice()` — with NO `use` import at all, proving namespaces provide zero privacy/access-control (anything can reach a namespaced class given its full name). Echo `total()` and `get_class($invoice)` (reports the full name).',
        starter: '',
        tests: `
assert output === '500\\nCompany\\\\Billing\\\\Models\\\\Invoice'
`,
        solution: `<?php
namespace Company\\Billing\\Models;

class Invoice {
    public function total() {
        return 500;
    }
}

namespace Main;

$invoice = new \\Company\\Billing\\Models\\Invoice();
echo $invoice->total() . "\\n";
echo get_class($invoice) . "\\n";
`,
      },
    ],
  },
]

export default challenges
