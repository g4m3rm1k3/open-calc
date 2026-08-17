#include <iostream>
#include <string>
#include <stack>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    std::stack<TreeNode*> pending;
    pending.push(x);
    while (!pending.empty()) {
        TreeNode* current = pending.top();
        pending.pop();
        std::cout << current->label << " ";
        if (current->right != nullptr) pending.push(current->right);
        if (current->left != nullptr) pending.push(current->left);
    }
    std::cout << std::endl;

    return 0;
}
