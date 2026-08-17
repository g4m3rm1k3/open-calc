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

class TreeIterator {
public:
    explicit TreeIterator(TreeNode* root) {
        if (root != nullptr) {
            pending.push(root);
            advance();
        }
    }

    TreeIterator() : current(nullptr) {}

    TreeNode& operator*() {
        return *current;
    }

    TreeIterator& operator++() {
        advance();
        return *this;
    }

    bool operator!=(const TreeIterator& other) const {
        return current != other.current;
    }

private:
    void advance() {
        if (pending.empty()) {
            current = nullptr;
            return;
        }
        current = pending.top();
        pending.pop();
        if (current->right != nullptr) pending.push(current->right);
        if (current->left != nullptr) pending.push(current->left);
    }

    TreeNode* current = nullptr;
    std::stack<TreeNode*> pending;
};

class Tree {
public:
    explicit Tree(TreeNode* root) : root(root) {}

    TreeIterator begin() { return TreeIterator(root); }
    TreeIterator end() { return TreeIterator(); }

private:
    TreeNode* root;
};

int main() {
    TreeNode* d = new TreeNode{"D", 2, nullptr, nullptr};
    TreeNode* e = new TreeNode{"E", 5, nullptr, nullptr};
    TreeNode* f = new TreeNode{"F", 3, nullptr, nullptr};
    TreeNode* b = new TreeNode{"B", 1, d, e};
    TreeNode* c = new TreeNode{"C", 1, f, nullptr};
    TreeNode* a = new TreeNode{"A", 1, b, c};

    Tree tree(a);

    std::cout << "range-for:              ";
    for (TreeNode& node : tree) {
        std::cout << node.label << " ";
    }
    std::cout << std::endl;

    return 0;
}
