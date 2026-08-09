# Tutorial 4: Security Testing

## Introduction

Test that authorization is enforced correctly.

---

## Part 1: Auth Test Fixtures

```python
# tests/conftest.py additions

from partflow.domain.entities.user import User, Role


@pytest.fixture
def viewer_user():
    """User with only viewer role."""
    return User(
        id=uuid4(),
        username="viewer",
        email="viewer@example.com",
        roles={Role.VIEWER},
    )


@pytest.fixture
def engineer_user():
    """User with engineer role."""
    return User(
        id=uuid4(),
        username="engineer",
        email="engineer@example.com",
        roles={Role.ENGINEER},
    )


@pytest.fixture
def approver_user():
    """User with approver role."""
    return User(
        id=uuid4(),
        username="approver",
        email="approver@example.com",
        roles={Role.APPROVER},
    )


@pytest.fixture
def admin_user():
    """User with admin role."""
    return User(
        id=uuid4(),
        username="admin",
        email="admin@example.com",
        roles={Role.ADMIN},
    )
```

---

## Part 2: Permission Tests

```python
# tests/unit/auth/test_permissions.py

import pytest
from partflow.auth.permissions import Action, user_can


class TestViewerPermissions:
    """Test viewer role permissions."""
    
    def test_can_view_parts(self, viewer_user):
        assert user_can(viewer_user, Action.VIEW_PART)
    
    def test_cannot_create_parts(self, viewer_user):
        assert not user_can(viewer_user, Action.CREATE_PART)
    
    def test_cannot_approve(self, viewer_user):
        assert not user_can(viewer_user, Action.APPROVE_PART)


class TestEngineerPermissions:
    """Test engineer role permissions."""
    
    def test_can_create_parts(self, engineer_user):
        assert user_can(engineer_user, Action.CREATE_PART)
    
    def test_can_edit_parts(self, engineer_user):
        assert user_can(engineer_user, Action.EDIT_PART)
    
    def test_cannot_approve(self, engineer_user):
        assert not user_can(engineer_user, Action.APPROVE_PART)


class TestApproverPermissions:
    """Test approver role permissions."""
    
    def test_can_approve(self, approver_user):
        assert user_can(approver_user, Action.APPROVE_PART)


class TestAdminPermissions:
    """Test admin has all permissions."""
    
    def test_has_all_permissions(self, admin_user):
        for action in Action:
            assert user_can(admin_user, action)
```

---

## Part 3: Route Security Tests

```python
# tests/e2e/test_route_security.py

import pytest
from flask_login import login_user


class TestRouteSecurityUnauthorized:
    """Test routes reject unauthorized users."""
    
    def test_create_part_requires_login(self, client):
        response = client.get('/parts/new')
        assert response.status_code in [302, 401]  # Redirect or unauthorized
    
    def test_approve_requires_login(self, client):
        response = client.post('/parts/12345678-1234-1234-1234-123456789abc/approve')
        assert response.status_code in [302, 401]


class TestRouteSecurityForbidden:
    """Test routes reject users without permission."""
    
    def test_viewer_cannot_create_part(self, client, viewer_user):
        # Login as viewer
        with client.session_transaction() as sess:
            sess['_user_id'] = str(viewer_user.id)
        
        response = client.get('/parts/new')
        assert response.status_code == 403
    
    def test_engineer_cannot_approve(self, client, engineer_user):
        with client.session_transaction() as sess:
            sess['_user_id'] = str(engineer_user.id)
        
        response = client.post('/parts/12345678.../approve')
        assert response.status_code == 403
```

---

## Part 4: Business Rule Tests

```python
# tests/unit/service/test_workflow_authorization.py

import pytest
from partflow.domain.errors import NotAuthorizedError


class TestApprovalAuthorization:
    """Test approval business rules."""
    
    def test_cannot_approve_own_part(self, workflow_service, mock_part_repo):
        """Author cannot approve their own Part."""
        part = create_part_with_author("engineer123")
        mock_part_repo.find_by_id.return_value = part
        
        with pytest.raises(NotAuthorizedError, match="own Part"):
            workflow_service.approve(
                part.id, 
                approved_by="engineer123"  # Same as author
            )
    
    def test_different_user_can_approve(self, workflow_service, mock_part_repo):
        """Different user can approve."""
        part = create_part_with_author("engineer123")
        part.status = PartStatus.REVIEW
        mock_part_repo.find_by_id.return_value = part
        
        # Different user - should work
        result = workflow_service.approve(part.id, approved_by="approver456")
        
        assert result.status == PartStatus.APPROVED
```

---

## Summary

### Phase 13 Complete!

Security implemented:
- ✅ User model with roles
- ✅ Role-based permissions
- ✅ Route protection decorators
- ✅ Resource-level authorization
- ✅ Security tests

**Next:** [Phase 14: Eventing & Observability →](../14-eventing-observability/README.md)
