#include <iostream>
#include <string>

class Visitor;

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
    void accept(Visitor& visitor);
};

class Visitor {
public:
    virtual void visit(TreeNode& node) = 0;
    virtual ~Visitor() = default;
};

void TreeNode::accept(Visitor& visitor) {
    // simplified: no recursion needed to demonstrate the break
    (void)visitor;
}

class PrintVisitor : public Visitor {
public:
    // typo: "Visit" instead of "visit" -- does not override the base method
    void Visit(TreeNode& node) {
        std::cout << node.label << " ";
    }
};

int main() {
    PrintVisitor printer;
    (void)printer;
    return 0;
}
