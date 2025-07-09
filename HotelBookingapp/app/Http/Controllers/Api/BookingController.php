<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Room;
use Illuminate\Http\Request;

class BookingController extends Controller
{

    public function index(){
        return response()->json(Booking::all(), 200);
    }
    public function store(Request $request)
    {

        $validatedData = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'guest_id' => 'required|exists:guests,id',
            'check_in_date' => 'required|date',
            'check_out_date' => 'required|date|after:check_in_date',
            'number_of_guests' => 'required|integer|min:1',
            'price' => 'required|integer|min:1',
        ]);



        $room = Room::findOrFail($validatedData['room_id']);

        if (!$room->is_available) {
            return response()->json([
                'message' => 'Room is not available currently'
            ], 403);
        }

        $booking = Booking::create([
            'room_id' => $validatedData['room_id'],
            'guest_id' => $validatedData['guest_id'],
            'check_in_date' => $validatedData['check_in_date'],
            'check_out_date' => $validatedData['check_out_date'],
            'number_of_guests' => $validatedData['number_of_guests'],
            'status' => 'pending',
            'price' => $validatedData['price'],
            'payment_status' => 'unpaid',

        ]);

        $room->is_available = false;
        $room->save();

        return response()->json($booking->load('room'), 201);

    }

    public function show(Request $request,int $id){
        $booking=Booking::findOrFail($id);
        return response()->json($booking->load('room'), 201);

    }
    public function update(Request $request,int $id){
        $validatedData = $request->validate([
            'room_id' => 'nullable|exists:rooms,id',
            'guest_id' => 'nullable|exists:guests,id',
            'check_in_date' => 'nullable|date',
            'check_out_date' => 'nullable|date|after:check_in_date',
            'number_of_guests' => 'nullable|integer|min:1',
            'price' => 'nullable|integer|min:1',

        ]);
        $booking=Booking::findOrFail($id);
        $booking->update($validatedData);
        return response()->json($booking->load('room'), 201);
    }

    public function destroy(int $id)
    {
        $booking=Booking::findOrFail($id);
        $booking->delete();
    }





}
