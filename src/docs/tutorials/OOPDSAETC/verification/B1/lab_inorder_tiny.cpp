#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

void inOrder(TreeNode* node) {
    if (node == nullptr) return;
    inOrder(node->left);
    std::cout << node->label << " ";
    inOrder(node->right);
}

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    inOrder(x);
    std::cout << std::endl;
    return 0;
}
