from database import Base
from sqlalchemy import Column,Integer,Boolean,Text,String,ForeignKey
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__='user'
    id=Column(Integer,primary_key=True)
    name=Column(String(80),nullable=True)
    username=Column(String(25),unique=True)
    email=Column(String(80),unique=True)
    password=Column(Text,nullable=True)
    is_staff=Column(Boolean,default=False)
    is_active=Column(Boolean,default=False)
    orders=relationship('Order',back_populates='user')


    def __repr__(self):
        return f"<User {self.username}"


class Order(Base):

    __tablename__='orders'
    id=Column(Integer,primary_key=True)
    quantity=Column(Integer,nullable=False)
    order_status=Column(String(20),default="PENDING")
    pizza_size=Column(String(20),default="SMALL")
    user_id=Column(Integer,ForeignKey('user.id'))
    user=relationship('User',back_populates='orders')

    def __repr__(self):
        return f"<Order {self.id}>"
