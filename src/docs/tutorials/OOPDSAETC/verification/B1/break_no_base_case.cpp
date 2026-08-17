#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

void preOrder(TreeNode* node) {
    // base case removed on purpose
    std::cout << node->label << " ";
    preOrder(node->left);
    preOrder(node->right);
}

int main() {
    TreeNode* d = new TreeNode{"D", nullptr, nullptr};
    TreeNode* e = new TreeNode{"E", nullptr, nullptr};
    TreeNode* f = new TreeNode{"F", nullptr, nullptr};
    TreeNode* b = new TreeNode{"B", d, e};
    TreeNode* c = new TreeNode{"C", f, nullptr};
    TreeNode* a = new TreeNode{"A", b, c};

    preOrder(a);
    std::cout << std::endl;
    return 0;
}
