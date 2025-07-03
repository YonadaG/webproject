<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Guest;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function store(Request $request){



        $validatedData = $request->validate([

            //Guest validation
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|email',
            'phone_number' => 'required|string',
            'address' => 'nullable|string',
            'national_id_or_passport' => 'nullable|string',



            //booking validation

            'room_id' => 'required|exists:rooms,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'number_of_guests' => 'required|integer|min:1'

        ]);

        $guest = Guest::create([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'phone_number' => $validatedData['phone_number'],
            'address' => $validatedData['address'],
            'national_id_or_passport' => $validatedData['national_id_or_passport'],

        ]);

        $booking = Booking::create([
            'room_id' => $validatedData['room_id'],
            'guest_id' => $guest->id,
            'check_in_date' => $validatedData['check_in_date'],
            'check_out_date' => $validatedData['check_out_date'],
            'number_of_guests' => $validatedData['number_of_guests'],
            'status' => 'pending',
            'price'=>'price',
            'payment_status'=>'unpaid',

        ]);

        return response()->json($booking->load('room'), 201);

    }


}
