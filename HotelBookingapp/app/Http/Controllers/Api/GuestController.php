<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Request;
use League\CommonMark\Extension\Footnote\Event\GatherFootnotesListener;

class GuestController extends Controller
{
    public function  index(): \Illuminate\Database\Eloquent\Collection
    {
        return Guest::all();
    }
    public function show($id): \Illuminate\Database\Eloquent\Collection
    {
        return Guest::findOrFail($id);

    }
    public function store(Request $request){

        $validatedData = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'phone_number' => 'required|string',
            'address' => 'nullable|string',
            'national_id_or_passport' => 'nullable|string',
        ]);


        $guest=Guest::create($validatedData);
        return response()->json($guest, 201);
    }







}
