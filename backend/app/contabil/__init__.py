from fastapi import APIRouter

from . import models, crud, schemas, router  # expose submodules

router = router.router
