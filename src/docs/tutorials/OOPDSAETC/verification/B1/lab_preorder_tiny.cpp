#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

void preOrder(TreeNode* node) {
    if (node == nullptr) return;
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    preOrder(x);
    std::cout << std::endl;
    return 0;
}
