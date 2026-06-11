<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class StressController extends Controller
{
    /**
     * Synthetic CPU-bound load generator used to exercise the Horizontal Pod
     * Autoscaler during resiliency and stress testing. Runs a tight
     * 10-million-iteration math loop to drive average pod CPU past the HPA
     * threshold. Intended to be hammered with a load tool such as `hey`.
     */
    public function heavy(): JsonResponse
    {
        $iterations = 10_000_000;
        $sum = 0.0;

        // Non-trivial math so the work cannot be optimized away.
        for ($i = 1; $i <= $iterations; $i++) {
            $sum += sqrt($i) * sin($i);
        }

        return response()->json([
            'message' => 'Heavy computation complete.',
            'iterations' => $iterations,
            'result' => $sum,
        ]);
    }
}
