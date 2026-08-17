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

int main() {
    TreeNode* d = new TreeNode{"D", nullptr, nullptr};
    TreeNode* e = new TreeNode{"E", nullptr, nullptr};
    TreeNode* f = new TreeNode{"F", nullptr, nullptr};
    TreeNode* b = new TreeNode{"B", d, e};
    TreeNode* c = new TreeNode{"C", f, nullptr};
    TreeNode* a = new TreeNode{"A", b, c};

    std::cout << "pre-order:  ";
    preOrder(a);
    std::cout << std::endl;

    std::cout << "in-order:   ";
    inOrder(a);
    std::cout << std::endl;

    std::cout << "post-order: ";
    postOrder(a);
    std::cout << std::endl;

    return 0;
}
