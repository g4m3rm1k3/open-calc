from asset_manager.domain.asset import Asset, InvalidAssetError


class ApplicationState:
    def __init__(self) -> None:
        self.assets: list[Asset] = []
        self.validation_errors: list[InvalidAssetError] = []
