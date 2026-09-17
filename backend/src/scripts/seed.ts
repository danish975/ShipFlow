import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Shipment } from '../models/Shipment';
import { ShipmentEvent } from '../models/ShipmentEvent';
import { Notification } from '../models/Notification';
import { UserRole, ShipmentStatus, ShipmentEventType, NotificationType } from '../types';
import { generateTrackingNumber } from '../utils/tracking';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipflow';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Shipment.deleteMany({}),
      ShipmentEvent.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // ── Create Users ────────────────────────────────────
    const hashedPassword = await bcrypt.hash('password123', 12);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@shipflow.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      phone: '+1-555-0100',
    });

    const customers = await User.create([
      { name: 'Alice Johnson', email: 'alice@example.com', password: hashedPassword, role: UserRole.CUSTOMER, phone: '+1-555-0101' },
      { name: 'Bob Williams', email: 'bob@example.com', password: hashedPassword, role: UserRole.CUSTOMER, phone: '+1-555-0102' },
      { name: 'Carol Davis', email: 'carol@example.com', password: hashedPassword, role: UserRole.CUSTOMER, phone: '+1-555-0103' },
    ]);

    const agents = await User.create([
      { name: 'Dave Wilson', email: 'dave@shipflow.com', password: hashedPassword, role: UserRole.AGENT, phone: '+1-555-0201' },
      { name: 'Eve Martinez', email: 'eve@shipflow.com', password: hashedPassword, role: UserRole.AGENT, phone: '+1-555-0202' },
      { name: 'Frank Brown', email: 'frank@shipflow.com', password: hashedPassword, role: UserRole.AGENT, phone: '+1-555-0203' },
    ]);

    console.log('Created users: 1 admin, 3 customers, 3 agents');

    // ── Create Shipments ────────────────────────────────
    const shipmentData = [
      {
        customerId: customers[0]._id,
        deliveryAgentId: agents[0]._id,
        status: ShipmentStatus.DELIVERED,
        pickupAddress: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'US' },
        deliveryAddress: { street: '456 Oak Ave', city: 'Brooklyn', state: 'NY', zipCode: '11201', country: 'US' },
        packageDetails: { weight: 2.5, dimensions: '30x20x15cm', description: 'Laptop Computer', category: 'electronics' },
      },
      {
        customerId: customers[0]._id,
        deliveryAgentId: agents[1]._id,
        status: ShipmentStatus.IN_TRANSIT,
        pickupAddress: { street: '789 Pine Rd', city: 'Manhattan', state: 'NY', zipCode: '10002', country: 'US' },
        deliveryAddress: { street: '321 Elm Blvd', city: 'Queens', state: 'NY', zipCode: '11101', country: 'US' },
        packageDetails: { weight: 1.0, dimensions: '25x15x10cm', description: 'Winter Jacket', category: 'clothing' },
      },
      {
        customerId: customers[0]._id,
        status: ShipmentStatus.CREATED,
        pickupAddress: { street: '555 River Dr', city: 'Hoboken', state: 'NJ', zipCode: '07030', country: 'US' },
        deliveryAddress: { street: '777 Lake Rd', city: 'Jersey City', state: 'NJ', zipCode: '07302', country: 'US' },
        packageDetails: { weight: 5.0, dimensions: '50x40x30cm', description: 'Office Chair Parts', category: 'furniture' },
      },
      {
        customerId: customers[1]._id,
        deliveryAgentId: agents[0]._id,
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        pickupAddress: { street: '100 Tech Ave', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'US' },
        deliveryAddress: { street: '200 Hill St', city: 'Oakland', state: 'CA', zipCode: '94607', country: 'US' },
        packageDetails: { weight: 0.5, dimensions: '20x15x5cm', description: 'Legal Documents', category: 'documents' },
      },
      {
        customerId: customers[1]._id,
        deliveryAgentId: agents[2]._id,
        status: ShipmentStatus.PICKED_UP,
        pickupAddress: { street: '300 Market St', city: 'San Jose', state: 'CA', zipCode: '95110', country: 'US' },
        deliveryAddress: { street: '400 Beach Blvd', city: 'Santa Cruz', state: 'CA', zipCode: '95060', country: 'US' },
        packageDetails: { weight: 3.0, dimensions: '40x30x20cm', description: 'Ceramic Vase Set', category: 'fragile' },
      },
      {
        customerId: customers[1]._id,
        deliveryAgentId: agents[1]._id,
        status: ShipmentStatus.DELIVERED,
        pickupAddress: { street: '500 Broadway', city: 'Los Angeles', state: 'CA', zipCode: '90012', country: 'US' },
        deliveryAddress: { street: '600 Sunset Blvd', city: 'Hollywood', state: 'CA', zipCode: '90028', country: 'US' },
        packageDetails: { weight: 1.5, dimensions: '30x25x10cm', description: 'Artisanal Chocolates', category: 'food' },
      },
      {
        customerId: customers[2]._id,
        deliveryAgentId: agents[2]._id,
        status: ShipmentStatus.ASSIGNED,
        pickupAddress: { street: '700 Congress Ave', city: 'Austin', state: 'TX', zipCode: '73301', country: 'US' },
        deliveryAddress: { street: '800 Main Plaza', city: 'San Antonio', state: 'TX', zipCode: '78205', country: 'US' },
        packageDetails: { weight: 4.0, dimensions: '45x35x25cm', description: 'Home Speaker System', category: 'electronics' },
      },
      {
        customerId: customers[2]._id,
        status: ShipmentStatus.CANCELLED,
        pickupAddress: { street: '900 Peachtree St', city: 'Atlanta', state: 'GA', zipCode: '30309', country: 'US' },
        deliveryAddress: { street: '1000 Spring St', city: 'Marietta', state: 'GA', zipCode: '30060', country: 'US' },
        packageDetails: { weight: 0.3, dimensions: '15x10x5cm', description: 'Phone Case', category: 'other' },
      },
      {
        customerId: customers[2]._id,
        deliveryAgentId: agents[0]._id,
        status: ShipmentStatus.DELIVERED,
        pickupAddress: { street: '1100 Michigan Ave', city: 'Chicago', state: 'IL', zipCode: '60601', country: 'US' },
        deliveryAddress: { street: '1200 State St', city: 'Evanston', state: 'IL', zipCode: '60201', country: 'US' },
        packageDetails: { weight: 2.0, dimensions: '35x25x15cm', description: 'Programming Books', category: 'documents' },
      },
      {
        customerId: customers[0]._id,
        deliveryAgentId: agents[1]._id,
        status: ShipmentStatus.ASSIGNED,
        pickupAddress: { street: '1300 K St', city: 'Washington', state: 'DC', zipCode: '20005', country: 'US' },
        deliveryAddress: { street: '1400 Penn Ave', city: 'Alexandria', state: 'VA', zipCode: '22301', country: 'US' },
        packageDetails: { weight: 6.0, dimensions: '60x40x40cm', description: 'Wine Glass Collection', category: 'fragile' },
      },
      {
        customerId: customers[1]._id,
        deliveryAgentId: agents[2]._id,
        status: ShipmentStatus.IN_TRANSIT,
        pickupAddress: { street: '1500 Pike St', city: 'Seattle', state: 'WA', zipCode: '98101', country: 'US' },
        deliveryAddress: { street: '1600 Rose Ave', city: 'Portland', state: 'OR', zipCode: '97201', country: 'US' },
        packageDetails: { weight: 1.2, dimensions: '28x20x12cm', description: 'Hiking Boots', category: 'clothing' },
      },
      {
        customerId: customers[2]._id,
        deliveryAgentId: agents[0]._id,
        status: ShipmentStatus.OUT_FOR_DELIVERY,
        pickupAddress: { street: '1700 Collins Ave', city: 'Miami', state: 'FL', zipCode: '33139', country: 'US' },
        deliveryAddress: { street: '1800 Ocean Dr', city: 'Fort Lauderdale', state: 'FL', zipCode: '33316', country: 'US' },
        packageDetails: { weight: 0.8, dimensions: '22x18x8cm', description: 'Sunscreen Kit', category: 'other' },
      },
    ];

    const shipments = [];
    for (const data of shipmentData) {
      const shipment = await Shipment.create({
        ...data,
        trackingNumber: generateTrackingNumber(),
        estimatedDelivery: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
      shipments.push(shipment);
    }

    console.log(`Created ${shipments.length} shipments`);

    // ── Create Shipment Events ──────────────────────────
    const eventPromises = [];
    for (const shipment of shipments) {
      // Always create a CREATED event
      eventPromises.push(
        ShipmentEvent.create({
          shipmentId: shipment._id,
          eventType: ShipmentEventType.CREATED,
          status: ShipmentStatus.CREATED,
          metadata: { autoGenerated: true },
        })
      );

      const statusOrder = [
        ShipmentStatus.ASSIGNED,
        ShipmentStatus.PICKED_UP,
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
      ];

      const currentIndex = statusOrder.indexOf(shipment.status);
      if (currentIndex >= 0) {
        for (let i = 0; i <= currentIndex; i++) {
          eventPromises.push(
            ShipmentEvent.create({
              shipmentId: shipment._id,
              eventType: `shipment.${statusOrder[i].toLowerCase()}` as ShipmentEventType,
              status: statusOrder[i],
              metadata: { autoGenerated: true },
            })
          );
        }
      }

      if (shipment.status === ShipmentStatus.CANCELLED) {
        eventPromises.push(
          ShipmentEvent.create({
            shipmentId: shipment._id,
            eventType: ShipmentEventType.CANCELLED,
            status: ShipmentStatus.CANCELLED,
            metadata: { autoGenerated: true },
          })
        );
      }
    }
    await Promise.all(eventPromises);
    console.log('Created shipment events');

    // ── Create Notifications ────────────────────────────
    const notificationPromises = [];
    for (const shipment of shipments) {
      notificationPromises.push(
        Notification.create({
          userId: shipment.customerId,
          shipmentId: shipment._id,
          type: NotificationType.SHIPMENT_CREATED,
          title: 'Shipment Created',
          message: `Your shipment ${shipment.trackingNumber} has been created.`,
          read: Math.random() > 0.5,
        })
      );

      if (shipment.status === ShipmentStatus.DELIVERED) {
        notificationPromises.push(
          Notification.create({
            userId: shipment.customerId,
            shipmentId: shipment._id,
            type: NotificationType.SHIPMENT_DELIVERED,
            title: 'Package Delivered',
            message: `Your shipment ${shipment.trackingNumber} has been delivered!`,
            read: false,
          })
        );
      }
    }
    await Promise.all(notificationPromises);
    console.log('Created notifications');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('  Admin:    admin@shipflow.com / password123');
    console.log('  Customer: alice@example.com  / password123');
    console.log('  Customer: bob@example.com    / password123');
    console.log('  Customer: carol@example.com  / password123');
    console.log('  Agent:    dave@shipflow.com  / password123');
    console.log('  Agent:    eve@shipflow.com   / password123');
    console.log('  Agent:    frank@shipflow.com / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
