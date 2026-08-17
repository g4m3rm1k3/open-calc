#include <iostream>
#include <string>
#include <stack>

class Visitor;

struct TreeNode {
    std::string label;
    int quantity;
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
    visitor.visit(*this);
    if (left != nullptr) left->accept(visitor);
    if (right != nullptr) right->accept(visitor);
}

class PrintVisitor : public Visitor {
public:
    void visit(TreeNode& node) override {
        std::cout << node.label << " ";
    }
};

class CountVisitor : public Visitor {
public:
    void visit(TreeNode& node) override {
        (void)node;
        count++;
    }
    int count = 0;
};

class SumVisitor : public Visitor {
public:
    void visit(TreeNode& node) override {
        total += node.quantity;
    }
    int total = 0;
};

int main() {
    TreeNode* d = new TreeNode{"D", 2, nullptr, nullptr};
    TreeNode* e = new TreeNode{"E", 5, nullptr, nullptr};
    TreeNode* f = new TreeNode{"F", 3, nullptr, nullptr};
    TreeNode* b = new TreeNode{"B", 1, d, e};
    TreeNode* c = new TreeNode{"C", 1, f, nullptr};
    TreeNode* a = new TreeNode{"A", 1, b, c};

    PrintVisitor printer;
    a->accept(printer);
    std::cout << std::endl;

    CountVisitor counter;
    a->accept(counter);
    std::cout << "count: " << counter.count << std::endl;

    SumVisitor summer;
    a->accept(summer);
    std::cout << "total: " << summer.total << std::endl;

    return 0;
}
