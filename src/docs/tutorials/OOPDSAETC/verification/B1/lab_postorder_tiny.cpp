#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

void postOrder(TreeNode* node) {
    if (node == nullptr) return;
    postOrder(node->left);
    postOrder(node->right);
    std::cout << node->label << " ";
}

int main() {
    TreeNode* y = new TreeNode{"Y", nullptr, nullptr};
    TreeNode* z = new TreeNode{"Z", nullptr, nullptr};
    TreeNode* x = new TreeNode{"X", y, z};

    postOrder(x);
    std::cout << std::endl;
    return 0;
}
