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

void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}

void inOrder(TreeNode* node) {
    if (node == nullptr) return;
    inOrder(node->left);
    std::cout << node->label << " ";
    inOrder(node->right);
}

void postOrder(TreeNode* node) {
    if (node == nullptr) return;
    postOrder(node->left);
    postOrder(node->right);
    std::cout << node->label << " ";
}

void iterativePreOrder(TreeNode* root) {
    if (root == nullptr) return;
    std::stack<TreeNode*> pending;
    pending.push(root);
    while (!pending.empty()) {
        TreeNode* current = pending.top();
        pending.pop();
        std::cout << current->label << " ";
        if (current->right != nullptr) pending.push(current->right);
        if (current->left != nullptr) pending.push(current->left);
    }
}

int main() {
    TreeNode* d = new TreeNode{"D", 2, nullptr, nullptr};
    TreeNode* e = new TreeNode{"E", 5, nullptr, nullptr};
    TreeNode* f = new TreeNode{"F", 3, nullptr, nullptr};
    TreeNode* b = new TreeNode{"B", 1, d, e};
    TreeNode* c = new TreeNode{"C", 1, f, nullptr};
    TreeNode* a = new TreeNode{"A", 1, b, c};

    std::cout << "pre-order (recursive): ";
    preOrder(a);
    std::cout << std::endl;

    std::cout << "in-order:              ";
    inOrder(a);
    std::cout << std::endl;

    std::cout << "post-order:            ";
    postOrder(a);
    std::cout << std::endl;

    std::cout << "pre-order (iterative): ";
    iterativePreOrder(a);
    std::cout << std::endl;

    std::cout << "visitor (print):       ";
    PrintVisitor printer;
    a->accept(printer);
    std::cout << std::endl;

    CountVisitor counter;
    a->accept(counter);
    std::cout << "visitor (count):       " << counter.count << std::endl;

    SumVisitor summer;
    a->accept(summer);
    std::cout << "visitor (total):       " << summer.total << std::endl;

    return 0;
}
