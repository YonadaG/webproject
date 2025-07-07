<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;


class RoomController extends Controller
{
    public function index(): \Illuminate\Database\Eloquent\Collection
    {
        return Room::all();
    }

    public function show($id)
    {
        return Room::findOrFail($id);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'room_no' => 'required|unique:rooms',
            'room_type' => 'required',
            'bed_count' => 'required',
            'price_perNight' => 'required',
            'is_available' => 'required',
            'max_occupancy'=> 'required',
            'features' => 'nullable',

            ]);


        $room =Room::create($validatedData);
        return response()->json($room, 201);

    }

    public function update(Request $request, $id){
        $validatedData = $request->validate([
            'room_no' => 'required|unique:rooms',
            'room_type' => 'nullable',
            'bed_count' => 'nullable',
            'price_perNight' => 'nullable',
            'is_available' => 'nullable',
            'max_occupancy'=> 'nullable',
            'features' => 'nullable|string',

        ]);

        $room= Room::findOrFail($id);
        $room->update($validatedData);
        return response()->json($room, 200);
    }

    public function delete($id){
        $room= Room::findOrFail($id);
        return response()->json('Room deleted', 200);
    }





}
