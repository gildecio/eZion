from fastapi import APIRouter

from . import models, crud, router  # expose submodules

router = router.router
