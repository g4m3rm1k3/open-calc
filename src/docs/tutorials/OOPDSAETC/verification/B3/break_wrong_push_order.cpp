#include <iostream>
#include <string>
#include <stack>

struct TreeNode {
    std::string label;
    int quantity;
    TreeNode* left;
    TreeNode* right;
};

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
        // bug: left pushed before right (swapped from the correct order)
        if (current->left != nullptr) pending.push(current->left);
        if (current->right != nullptr) pending.push(current->right);
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

    std::cout << "range-for (buggy push order): ";
    for (TreeNode& node : tree) {
        std::cout << node.label << " ";
    }
    std::cout << std::endl;

    return 0;
}
