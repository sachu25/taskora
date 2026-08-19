<?php

namespace App\Domain\Issue\Actions;

use App\Models\Label;

class DeleteOrganizationLabel
{
    public function execute(Label $label): void
    {
        $label->delete();
    }
}
