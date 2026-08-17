#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;
};

int main() {
    TreeNode leaf{"B", nullptr, nullptr};
    std::cout << leaf.label << " " << leaf.left << " " << leaf.right << std::endl;
    return 0;
}
