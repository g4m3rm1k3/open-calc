#include <iostream>
#include <string>

struct TreeNode {
    std::string label;
    TreeNode* left;
    TreeNode* right;

    void accept(Visitor& visitor);
};

class Visitor {
public:
    virtual void visit(TreeNode& node) = 0;
    virtual ~Visitor() = default;
};

int main() {
    return 0;
}
