<?php

namespace App\Domain\Issue\Actions;

use App\Models\Label;

class UpdateOrganizationLabel
{
    public function execute(Label $label, array $data): Label
    {
        $label->update(array_filter([
            'name' => $data['name'] ?? null,
            'color' => $data['color'] ?? null,
        ], fn ($val) => !is_null($val)));

        return $label;
    }
}
