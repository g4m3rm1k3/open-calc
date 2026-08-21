class InvalidAssetError(ValueError):
    def __init__(self, field: str, message: str) -> None:
        self.field = field
        super().__init__(message)


try:
    raise InvalidAssetError("name", "Asset name must not be empty")
except InvalidAssetError as error:
    print(f"field={error.field!r}, message={error}")

try:
    raise InvalidAssetError("name", "Asset name must not be empty")
except ValueError as error:
    print(f"caught as plain ValueError too: {error}")
