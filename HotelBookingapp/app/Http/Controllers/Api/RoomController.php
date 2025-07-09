<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class RoomController extends Controller
{
    public function index(): JsonResponse
    {
        $rooms = Room::all();
        return response()->json($rooms, 200);
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
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',


            ]);


        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('image', 'public');
            $validatedData['image'] = $path;
        }


        $room =Room::create($validatedData);
        return response()->json($room, 201);

    }

    public function update(Request $request, $id){
        $room= Room::findOrFail($id);
        $validatedData = $request->validate([
            'room_no' => 'required|unique:rooms,room_no,' . $room->id,
            'room_type' => 'nullable',
            'bed_count' => 'nullable',
            'price_perNight' => 'nullable',
            'is_available' => 'nullable',
            'max_occupancy'=> 'nullable',
            'features' => 'nullable|string',

        ]);
        if ($request->hasFile('image')) {
            if ($room->image) {
                Storage::disk('public')->delete($room->image);
            }

            $path = $request->file('image')->store('image', 'public');
            $validatedData['image'] = $path;
        }


        $room->update($validatedData);
        return response()->json($room, 200);
    }

    public function destroy($id){
        $room= Room::findOrFail($id);
        if ($room->image) {
            Storage::disk('public')->delete($room->image);
        }
        $room->delete();
        return response()->json('Room deleted', 200);
    }





}
